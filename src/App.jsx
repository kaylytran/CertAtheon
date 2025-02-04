import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route, 
  Routes,
  Navigate
} from "react-router-dom";

import Home from './components/Home';

import './App.css';

function App() {
  return <Home />;
}

export default App;
