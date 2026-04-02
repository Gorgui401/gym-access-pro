import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, CreditCard, AlertTriangle, TrendingUp, ArrowRight, ArrowUpRight, ArrowDownRight, Calendar as CalendarIcon, Activity, Clock, Search, Filter, MoreHorizontal, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clientService } from '@/services/clientService';
import { subscriptionService } from '@/services/subscriptionService';
import { paymentService } from '@/services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GymSetup from '@/components/GymSetup';

const DashboardPage = () => {
  const { user, gymId, refreshProfile } = useAuth();
  const [stats, setStats] = useState({ clients: 0, activeSubscriptions: 0, expiredSubscriptions: 0, monthlyRevenue: 0 });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [paymentSearch, setPaymentSearch] = useState('');

  useEffect(() => {
    if (!gymId) return;

    const fetchAll = async () => {
      const [clientCount, activeCount, expiredCount, revenue, recent, payments] = await Promise.all([
        clientService.count(gymId),
        subscriptionService.countByStatus(gymId, 'actif'),
        subscriptionService.countByStatus(gymId, 'expiré'),
        paymentService.getMonthlyRevenue(gymId),
        clientService.getRecent(gymId, 5),
        paymentService.getByGym(gymId, 10),
      ]);

      setStats({ clients: clientCount, activeSubscriptions: activeCount, expiredSubscriptions: expiredCount, monthlyRevenue: revenue });
      setRecentClients(recent);
      setRecentPayments(payments);
    };

    fetchAll();
  }, [gymId]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Manager';

  // Mock monthly chart data (will use real data when available)
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû'];
    return months.map((m) => ({
      name: m,
      revenus: Math.floor(Math.random() * 400000) + 100000,
      depenses: Math.floor(Math.random() * 200000) + 50000,
    }));
  }, []);

  // Weekly activity data
  const weeklyData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((d) => ({
      name: d,
      checkins: Math.floor(Math.random() * 30) + 5,
    }));
  }, []);

  const totalCapacity = stats.clients > 0 ? stats.clients : 100;
  const activePercentage = totalCapacity > 0 ? Math.round((stats.activeSubscriptions / totalCapacity) * 100) : 0;

  const filteredPayments = recentPayments.filter((p) =>
    !paymentSearch || p.clients?.name?.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  if (!gymId) {
    return <GymSetup onComplete={() => refreshProfile()} />;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Suivez vos performances, gérez vos clients et optimisez votre salle.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Clients */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Clients</span>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-display tracking-tight">{stats.clients.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              <span className="text-xs font-semibold text-[hsl(var(--success))]">+12%</span>
              <span className="text-xs text-muted-foreground">ce mois</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions - Orange accent */}
        <Card className="border-0 shadow-sm bg-primary text-primary-foreground hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">Abonnements Actifs</span>
              <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-display tracking-tight">{stats.activeSubscriptions.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-primary-foreground/80" />
              <span className="text-xs font-semibold text-primary-foreground/80">+7%</span>
              <span className="text-xs text-primary-foreground/60">ce mois</span>
            </div>
          </CardContent>
        </Card>

        {/* Expired */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expirés</span>
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--warning)/0.12)] flex items-center justify-center text-[hsl(var(--warning))]">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-display tracking-tight">{stats.expiredSubscriptions.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
              <span className="text-xs font-semibold text-[hsl(var(--destructive))]">-5%</span>
              <span className="text-xs text-muted-foreground">ce mois</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenus du mois</span>
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--success)/0.12)] flex items-center justify-center text-[hsl(var(--success))]">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-display tracking-tight">{stats.monthlyRevenue.toLocaleString()} F</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              <span className="text-xs font-semibold text-[hsl(var(--success))]">+4%</span>
              <span className="text-xs text-muted-foreground">ce mois</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">Revenus & Dépenses</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Vue des performances financières</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Revenus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                  <span className="text-muted-foreground">Dépenses</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} F`, '']}
                  />
                  <Bar dataKey="revenus" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="depenses" fill="hsl(var(--foreground) / 0.2)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold font-display">Calendrier</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex justify-center">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              locale={fr}
              className="rounded-xl"
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Activity chart + Capacity + Recent Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weekly Check-ins */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold font-display">Check-ins hebdo</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="checkinGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="checkins" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#checkinGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Capacity / Active Rate */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold font-display">Taux d'activité</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-extrabold font-display text-primary">{activePercentage}%</span>
                <span className="text-xs text-muted-foreground">d'abonnements actifs</span>
              </div>
              <Progress value={activePercentage} className="h-3 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[hsl(var(--success)/0.08)] p-3">
                <p className="text-lg font-bold font-display text-[hsl(var(--success))]">{stats.activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--destructive)/0.08)] p-3">
                <p className="text-lg font-bold font-display text-[hsl(var(--destructive))]">{stats.expiredSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Expirés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold font-display">Clients récents</CardTitle>
              <Link to="/clients" className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {recentClients.length === 0 && (
                <p className="text-muted-foreground text-sm py-6 text-center">Aucun client</p>
              )}
              {recentClients.map((client) => (
                <Link key={client.id} to={`/clients/${client.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  {client.photo_url ? (
                    <img src={client.photo_url} alt={client.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {client.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.phone || 'Pas de tél.'}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Payments Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-bold font-display">Activités récentes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="pl-9 h-9 w-48 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Montant</TableHead>
                  <TableHead className="text-xs">Méthode</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucun paiement enregistré
                    </TableCell>
                  </TableRow>
                )}
                {filteredPayments.map((payment, i) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      PAY_{String(i + 1).padStart(5, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {payment.clients?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium">{payment.clients?.name || 'Inconnu'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">{payment.amount?.toLocaleString()} F</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-medium capitalize">
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.18)] border-0">
                        Complété
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {payment.date ? format(new Date(payment.date), "d MMM yyyy, HH:mm", { locale: fr }) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
