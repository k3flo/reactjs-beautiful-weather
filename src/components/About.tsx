import * as React from 'react';

export const About = () => (
	<div className='container'>
		<div className='row justify-content-md-center'>
			<div className='col-8'>
				<h1 className='text-center'>About</h1>
				<p>
					This is an open source weather web application using React, Redux, Typescript, Webpack4, React Toolbox,
					Bootstrap4 and D3v5.
				</p>
				<p>
					Source code:
					<a href="https://github.com/bluegray1015/reactjs-beautiful-weather">GitHub</a> and
					<a href="https://bitbucket.org/LaurenceHo/reactjs-beautiful-weather">BitBucket</a>
				</p>
				<p>
					Here are some of the libraries I used:
				</p>
				<ul>
					<li>
						<a href='https://facebook.github.io/react'>React</a>
						- A JavaScript library for building user interfaces.
					</li>
					<li>
						<a href='http://redux.js.org/'>Redux</a>
						- Redux is a predictable state container for JavaScript apps.
					</li>
					<li>
						<a href='https://webpack.js.org/concepts/'>Webpack</a>
						- Webpack is a module bundler.
					</li>
					<li>
						<a href='http://react-toolbox.io/'>React Toolbox</a>
						- React Toolbox is a set of React components that implement Google's Material Design specification. It's
						powered by CSS Modules and harmoniously integrates with your webpack workflow.
					</li>
					<li>
						<a href='https://v4-alpha.getbootstrap.com/'>Bootstrap4</a>
						- Bootstrap is one of the most popular HTML, CSS, and JS frameworks in the world for building responsive,
						mobile-first projects on the web.
					</li>
					<li>
						<a href='https://d3js.org/'>D3</a>
						- D3.js is a JavaScript library for manipulating documents based on data.
					</li>
				</ul>
				<p>
					API:
				</p>
				<ul>
					<li>
						<a href='http://openweathermap.org'>Open Weather Map</a>
						- I used Open Weather Map to search for weather data by city name.
					</li>
					<li>
						<a href='https://developers.google.com/maps/documentation/geocoding/start'>Google Maps Geocoding API</a>
						- I used this API to search user's location based on latitude and longitude.
					</li>
					<li>
						<a href='https://developers.google.com/maps/documentation/timezone/start'>Google Maps Time Zone API</a>
						- I used this API to get the time zone based on location.
					</li>
				</ul>
			</div>
		</div>
	</div>
);