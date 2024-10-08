import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/pages/Home.js'
import { Login } from './components/pages/Login.js'
import { Manage } from './components/pages/Manage.js';
import { Pending } from './components/pages/Pending.js';
import { useState } from 'react';

function App() {
  const [notif, setNotif] = useState(false);
  const [notifText, setNotifText] = useState('');

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/main' element={<Home/>}/>
          <Route path='/pending' element={<Pending notif={notif} setNotif={setNotif} setNotifText={setNotifText} notifText={notifText}/>}/>
          <Route path='/manage' element={<Manage notif={notif} setNotif={setNotif} setNotifText={setNotifText} notifText={notifText}/>}/>
          <Route path='/' element={<Login/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
