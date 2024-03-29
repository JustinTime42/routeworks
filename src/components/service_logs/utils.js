import { SET_LOG_ENTRIES } from '../../constants'
import React, {
    useEffect,
    useState,
    Component,
    createRef
  } from 'react'
  import { useDispatch, useSelector } from 'react-redux'
import { Button, Form } from 'react-bootstrap'
import { deleteItem } from '../../actions'
import { toLocalTime } from '../utils'

export const DeleteLogRenderer = (props) => {
    const logs = useSelector(state => state.setLogs.entries)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)

    const dispatch = useDispatch()
    const handleClick = () => {
        console.log(props)
        dispatch(deleteItem(props.data, logs, `organizations/${organization}/service_logs`, null, SET_LOG_ENTRIES))
    }
    return (
        <Button onClick={handleClick}>Delete</Button>
    )
}

export const DateTimeRenderer = (props) => {    
    const getValueToDisplay = (params) => {
        return params.value ? params.value : params.valueFormatted //? params.valueFormatted : params.value
    }
    const [cellValue, setCellValue] = useState(getValueToDisplay(props))
 
    useEffect(() => {
        console.log((props.valueFormatted))
        setCellValue(getValueToDisplay(props))
    }, [props])
 
    return (
        <div>{cellValue?.toLocaleString()}</div>
    )
}

export class DateTimeEditor extends Component {
    constructor(props) {
        super(props) 
        this.inputRef = createRef() 
        this.state = {
            value: props.value || toLocalTime(Date.now()).toISOString() //new Date(Date.now() - offset).toISOString().substring(0, 16)
        }
    }
 
    componentDidMount() {
        this.inputRef.current.focus()
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
        return (
            <input
                type='datetime-local'
                ref={this.inputRef}
                value={toLocalTime((Date.parse(this.state.value))).toISOString().substring(0, 16)}
                //value={(new Date((Date.parse(this.state.value)) - offset)).toISOString().substring(0, 16)}
                onChange={event => this.handleChange(event)}
                style={{width: "100%"}}
            />
        )
    }
}
