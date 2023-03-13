import { h } from 'preact';
import { Route, Router } from 'preact-router';

import NavBar from './header';

// Code-splitting is automated for `routes` directory
import Splash from '../routes/splash';
import Profile from '../routes/profile';
import Forecasts from "../routes/forecast-viz";

const App = () => (
	<div id="app">
		<NavBar />
		<main>
			<Router>
				<Route path="/" component={Splash} />
        <Route path="/forecasts" component={Forecasts} />
				<Route path="/profile/" component={Profile} user="me" />
				<Route path="/profile/:user" component={Profile} />
			</Router>
		</main>
	</div>
);

export default App;
