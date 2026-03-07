const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center">

      {/* animated circles */}
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse bottom-10 right-10"></div>

      {children}

    </div>
  );
};

export default AuthLayout;