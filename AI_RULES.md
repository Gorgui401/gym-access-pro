# AI Development Rules - GymFlow

## Tech Stack
- **Framework**: React 18 with Vite and TypeScript for a fast, type-safe development experience.
- **Styling**: Tailwind CSS for utility-first styling and responsive design.
- **UI Components**: shadcn/ui (built on Radix UI) for accessible and customizable components.
- **Backend & Auth**: Supabase for authentication, PostgreSQL database, and file storage.
- **Data Fetching**: TanStack Query (React Query) for caching, synchronization, and server state management.
- **Routing**: React Router DOM (v6) for client-side navigation.
- **Icons**: Lucide React for a consistent and modern icon set.
- **Forms**: React Hook Form combined with Zod for robust schema validation.
- **Charts**: Recharts for interactive and responsive data visualizations.
- **Dates**: date-fns for consistent date formatting and manipulation.

## Library Usage Rules

### UI & Styling
- **Components**: Always prioritize using existing components in `src/components/ui`. Do not reinvent buttons, inputs, or dialogs.
- **Icons**: Use `lucide-react` exclusively.
- **Layout**: Use Tailwind CSS utility classes. Avoid writing custom CSS in `.css` files unless absolutely necessary for global resets.
- **Responsive Design**: Always use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to ensure mobile-first compatibility.

### Data & Backend
- **Supabase**: Use the auto-generated client in `src/integrations/supabase/client.ts`. Do not initialize new Supabase clients elsewhere.
- **State Management**: Use TanStack Query for all API calls. Avoid `useEffect` for data fetching.
- **Services**: Logic for interacting with Supabase should reside in `src/services/`.

### Forms & Validation
- **Validation**: Use `zod` to define schemas for all forms and API responses.
- **Forms**: Use `react-hook-form` with the `@hookform/resolvers/zod` for all user inputs.

### Feedback & Interaction
- **Notifications**: Use `sonner` for success/error toasts.
- **Loading States**: Always provide visual feedback (skeletons or spinners) during data fetching.

### Code Structure
- **Pages**: Keep page components in `src/pages/`.
- **Components**: Keep reusable business components in `src/components/`.
- **Hooks**: Custom logic should be extracted into hooks in `src/hooks/`.