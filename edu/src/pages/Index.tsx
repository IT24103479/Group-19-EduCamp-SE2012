import { Link } from "react-router-dom";

<Link to="/admin">Admin</Link>

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome:Blank</h1>
        <p className="text-xl text-muted-foreground">Start</p>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <a
          href="/login"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-glow"
        >
          Login
        </a>
        <a
          href="/admin"
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary-light"
        >
          Admin
        </a>
      </div>
    </div>
  );
};


export default Index;
