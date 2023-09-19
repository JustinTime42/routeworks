import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, OverlayTrigger, Tooltip, Form } from 'react-bootstrap'
import { AgGridReact } from 'ag-grid-react'
import { getColumnDefs } from './headers'
import { deleteItem, editItem, setIsLoading, setLogs } from '../../actions'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { SET_LOG_ENTRIES } from '../../constants'
import { DateTimeEditor, DateTimeRenderer } from './utils'
import ButtonWithLoading from '../buttons/ButtonWithLoading'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../firebase'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { doc } from 'firebase/firestore'

const LogsTable = ({logType, editable, isAdmin, height}) => {
    const [columnDefs, setColumnDefs] = useState(getColumnDefs(logType))
    const [dueDate, setDueDate] = useState('')
    const logs = useSelector(state => state.setLogs.entries)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const isLoading = useSelector(state => state.setIsLoading.isLoading)  
    const colorMode = useSelector(state => state.setColorMode.colorMode)
    const gridRef = useRef();
    const [value, loading, error] = useDocumentData(
        doc(db, 'organizations/', organization),
        {
          snapshotListenOptions: { includeMetadataChanges: true },
        }
      )

    const dispatch = useDispatch()

    useEffect(() => {
        setColumnDefs(getColumnDefs(logType, editable))
        console.log(editable)
        console.log(logType)
    }, [logType, editable])

    useEffect(() => {
        //preserve scroll position between renders
    },[])

    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizable: true,
        editable: editable && ((logType === 'raw') || (logType === 'customer') || (logType === 'stripe')),
    }))

    const numberParser = (params) => {
        console.log(params.newValue)
        return Number(params.newValue)
    }

    const downloadListener = useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
      }, []);

    const deleteListener = useCallback(() => {
        gridRef.current.api.getSelectedRows().forEach(row => {
            dispatch(deleteItem(row.data, logs, `organizations/${organization}/service_logs`, null, SET_LOG_ENTRIES))
        })        
    }, [dispatch, logs, organization]);

    const addSelectedToInvoice = () => {    
        dispatch(setIsLoading(true))
        const createInvoiceItems = httpsCallable(functions, "createInvoiceItems") 
        const logsArray = gridRef.current.api.getSelectedRows()
        // iterate through logsArray, and set the invoice_item_id field in the corresponding item in logs to 1  
        createInvoiceItems({logsArray: logsArray.filter(i => !i.invoice_item_id)}) 
        .then(() => {
            logsArray.forEach(log => {
                const index = logs.findIndex(i => i.id === log.id)
                logs[index].invoice_item_id = 1
            })
            dispatch(setLogs(logs))
            dispatch(setIsLoading(false))
        })
        .catch(err => {            
            alert(err)
            dispatch(setIsLoading(false))
        })
    }

    const cellValueChangedListener = useCallback(e => {
        console.log(e.data)
        dispatch(editItem(e.data, logs, `organizations/${organization}/service_logs`, null, SET_LOG_ENTRIES))
    }, [])

    const onStopped = useCallback(e => { 
        console.log(e)
    },[])   

    const onFirstDataRendered = (params) => {
        if (!logs || !params) {
            return
        }
        console.log(gridRef.current.api)
        const nodesToSelect = [];
        gridRef.current.api.forEachNode((node) => {
          if (node.data && node.data.invoice_item_id) {
            nodesToSelect.push(node);
          }
        });
        console.log(nodesToSelect)
        gridRef.current.api.setNodesSelected({
          nodes: nodesToSelect,
          newValue: true,
        });
    };

    const onComponentStateChanged = () => {
        if (!logs) {
            return
        }
        console.log(gridRef.current.api)
        const nodesToSelect = [];
        gridRef.current.api.forEachNode((node) => {
          if (node.data && node.data.invoice_item_id) {
            nodesToSelect.push(node);
          }
        });
        console.log(nodesToSelect)
        gridRef.current.api.setNodesSelected({
          nodes: nodesToSelect,
          newValue: true,
        });
    }

    return (
        <div className={colorMode === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}  style={{width: '90%', height: height, marginRight: 'auto', marginLeft: 'auto'}}>
            {isAdmin && (
                <div style={{display: "flex"}}>
                    <Button 
                        style={{visibility: logs.length ? 'visible' : 'hidden', marginRight: "1em"}} 
                        onClick={downloadListener}>
                        Download CSV
                    </Button>
                    <ButtonWithLoading
                        handleClick={addSelectedToInvoice}
                        tooltip="Add selected items to each customer's next invoice."
                        buttonText="Invoice Selected"
                        isLoading={isLoading}
                        variant="primary"
                        style={{visibility: (logs.length && logType==="stripe") ? 'visible' : 'hidden', marginRight: "1em"}} 
                    />
                    {/* <Button 
                        style={{visibility: logs.length ? 'visible' : 'hidden', marginRight: "1em"}} 
                        onClick={deleteListener}>
                        Delete Selected
                    </Button>   */}
                </div>
            )}            
            <AgGridReact
                ref={gridRef} 
                alwaysShowHorizontalScroll = {true}
                rowData={logs} 
                columnDefs={columnDefs} 
                defaultColDef={defaultColDef}
                rowSelection='multiple'                
                onCellValueChanged={cellValueChangedListener}
                onCellEditingStopped={onStopped}
                showDisabledCheckboxes={true}
                rowMultiSelectWithClick={true}
                //onFirstDataRendered={onFirstDataRendered}
                suppressRowClickSelection={true}
                onComponentStateChanged={onComponentStateChanged}
            />            
        </div>
    )
}

export default LogsTable