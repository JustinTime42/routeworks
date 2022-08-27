import React, {
    forwardRef,
    memo,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
  } from 'react';

export const DateTimePicker = forwardRef((props, ref) => {
    const [value, setValue] = useState(parseInt(props.value));
    const refInput = useRef(null);
 
    useEffect(() => {
        // focus on the input
        refInput.current.focus();
    }, []);
 
    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
        return {
            // the final value to send to the grid, on completion of editing
            getValue() {
                // this simple editor doubles any value entered into the input
                return value;
            },
 
            // Gets called once before editing starts, to give editor a chance to
            // cancel the editing before it even starts.
            isCancelBeforeStart() {
                return false;
            },
 
            // Gets called once when editing is finished (eg if Enter is pressed).
            // If you return true, then the result of the edit will be ignored.
            isCancelAfterEnd() {
                // our editor will reject any value greater than 1000
                return value ;
            }
        };
    })

    const handleChange = (event) => {
        console.log(event.target.value)
        setValue(event.target.value)
    }
 
    return (
        <input type="datetime-local"
               ref={refInput}
               value={value}
               onChange={handleChange}
               style={{width: "100%"}}
        />
    );
 });