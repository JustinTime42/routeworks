import React, {
    useEffect,
    useState,
    Component,
    createRef
  } from 'react';

 export const DateTimeRenderer = (props) =>  {
    const getValueToDisplay = (params) => {
        return params.valueFormatted ? params.valueFormatted : params.value;
    }
    const [cellValue, setCellValue] = useState(getValueToDisplay(props))
 
    useEffect(() => {
        setCellValue(getValueToDisplay(props))
    }, [props])
 
    return (
        <div>{cellValue.toLocaleString()}</div>
    )
 }

 export class DateTimeEditor extends Component {
    constructor(props) {
        super(props) 
        this.inputRef = createRef() 
        this.state = {
            value: props.value
        }
    }
 
    componentDidMount() {
        this.inputRef.current.focus();
    }
 
    // the final value to send to the grid, on completion of editing
    getValue() {
        return new Date(this.state.value)
    }
 
    isCancelBeforeStart() {
        return false;
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }
 
    render() {
        const offset = new Date().getTimezoneOffset() * 60000
        return (
            <input
                type='datetime-local'
                ref={this.inputRef}
                value={(new Date((Date.parse(this.state.value)) - offset)).toISOString().substring(0, 16)}
                onChange={event => this.handleChange(event)}
                style={{width: "100%"}}
            />
        )
    }
 }
