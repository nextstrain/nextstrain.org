import { h } from 'preact';
import { Route, Router } from 'preact-router';

import NavBar from './header';

// Code-splitting is automated for `routes` directory
import Splash from '../routes/splash';
import Profile from '../routes/profile';

const App = () => (
	<div id="app">
		<NavBar />
		<main>
			<Router>
				<Route path="/" component={Splash} />
				<Route path="/profile/" component={Profile} user="me" />
				<Route path="/profile/:user" component={Profile} />
			</Router>
		</main>
	</div>
);

export default App;
