// import Login from './pages/Login';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Regsiter from './pages/Regsiter';
// import Home from './pages/Home';
// import Start from './components/Start';

// function App() {
//   return (
//     <div className="bg-[#F8F4EA]">
//       <Router>
//         <Routes>
//           <Route exact path="/login" element={<Login />} />
//           <Route exact path="/register" element={<Regsiter />} />
//           <Route exact path="/chats" element={<Home />} />
//           <Route exact path="/" element={<Start />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// }

// export default App;


import Login from './pages/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Regsiter from './pages/Regsiter';
import Home from './pages/Home';
import Start from './components/Start';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <div className="min-h-screen bg-[#F8F4EA] text-black dark:bg-zinc-800 dark:text-white transition-all duration-300">
      <Router>
        <ThemeToggle />
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Regsiter />} />
          <Route exact path="/chats" element={<Home />} />
          <Route exact path="/" element={<Start />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
