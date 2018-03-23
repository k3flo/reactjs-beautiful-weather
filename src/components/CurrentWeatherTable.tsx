import * as React from 'react';
import * as moment from 'moment';
import { Table, TableCell, TableRow } from 'react-toolbox/lib/table';
import { WeatherIcon } from './WeatherIcon';
import { WindIcon } from "./WindIcon";

interface CurrentWeatherTablePropTypes {
	weather: any
	location: string
	timezone: any
}

export class CurrentWeatherTable extends React.Component<CurrentWeatherTablePropTypes, any> {
	render() {
		const {weather, location, timezone} = this.props;
		const utcOffset = (timezone.rawOffset + timezone.dstOffset) / 3600;
		const sunriseTime = moment.unix(weather.sys.sunrise).utcOffset(utcOffset).format('HH:mm');
		const sunsetTime = moment.unix(weather.sys.sunset).utcOffset(utcOffset).format('HH:mm');

		return (
			<div className='col-4' style={{paddingTop: 50}}>
				<Table selectable={false}>
					<TableRow>
						<TableCell>Location</TableCell>
						<TableCell>{location}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Weather</TableCell>
						<TableCell><WeatherIcon code={weather.weather[0].id}/> {weather.weather[0].description}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Cloud Cover</TableCell>
						<TableCell>{weather.clouds.all} %</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Temperature</TableCell>
						<TableCell>{Math.round(weather.main.temp * 10) / 10} °C</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Wind</TableCell>
						<TableCell><WindIcon degree={weather.wind.deg}/> {weather.wind.speed} m/s</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Pressure</TableCell>
						<TableCell>{weather.main.pressure} hpa</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Humidity</TableCell>
						<TableCell>{weather.main.humidity} %</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Sunrise Time</TableCell>
						<TableCell><i className="wi wi-sunrise"></i> {sunriseTime}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Sunset Time</TableCell>
						<TableCell><i className="wi wi-sunset"></i> {sunsetTime}</TableCell>
					</TableRow>
				</Table>
			</div>
		);
	}
}