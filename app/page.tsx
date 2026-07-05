import { TodoApp } from '@/components/todo-app';

export default function HomePage() {
  return (
    <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
      <TodoApp />
    </main>
  );
}
