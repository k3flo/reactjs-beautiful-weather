import * as React from 'react';
import { Button } from 'react-toolbox/lib/button';
import { Input } from 'react-toolbox/lib/input';

interface WeatherFormProps {
	onSearch: any
	isDisabled: boolean
}

interface WeatherFormState {
	location: string
}

export class WeatherForm extends React.Component<WeatherFormProps, WeatherFormState> {
	constructor(props: WeatherFormProps) {
		super(props);

		this.state = {
			location: ''
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event: any) {
		const value = event.target.value;

		this.setState({location: value});
	}

	handleSubmit(event: any) {
		event.preventDefault();

		this.props.onSearch(this.state.location);
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					type='text'
					value={this.state.location}
					onChange={this.handleChange}
					placeholder='Search weather by city'
					className="form-control mr-sm-2"
					required
					disabled={this.props.isDisabled}
				/>
				{/*<Input*/}
					{/*className="search-input"*/}
					{/*type='text'*/}
					{/*label='Search weather by city'*/}
					{/*value={this.state.location}*/}
					{/*onChange={this.handleChange}*/}
					{/*disabled={this.props.isDisabled}*/}
				{/*/>*/}
				<Button label='Search' raised accent/>
			</form>
		);
	}
}