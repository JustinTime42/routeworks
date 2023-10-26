import React, { useState, useEffect} from 'react'
import { FormControl, ListGroup } from 'react-bootstrap'

const SearchableInput = ({name, searchValue, changeSearchValue, matches, selectItem, handleBlur}) => {
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    if (matches.length > 0 ) {
      setShowList(true)
    } else {
      setShowList(false)
    }
  }, [matches])

  useEffect(() => {
    // why does this break when I remove the setTimeout?        
    setTimeout(() => setShowList(false), 300) 
  }, [])

  const listStyle = {
    position: "absolute", 
    overflow: "scroll",
    zIndex: "99",
  } 

  const itemStyle = {
    whiteSpace: "nowrap",
  }

  const onBlur = (event) => {    
    handleBlur(event)
    // when I setShowList(false) it closes before it loads the selected item. why?
    setTimeout(() => setShowList(false), 300) 
  }

  return (
    <div style={{position: "relative"}}>
    <FormControl 
      name={name} 
      size="sm" 
      type="search" 
      onChange={changeSearchValue} 
      placeholder="search" 
      value={searchValue} 
      onBlur={onBlur}
      autoComplete="off"
      onFocus={() => setShowList(true)}
    />
    <ListGroup style={listStyle} as="ul">
    {
      showList &&
        matches.map(customer => (
          <ListGroup.Item 
            style={itemStyle}
            key={customer.id}
            action onClick={(event) => selectItem(event, customer)}
          >
          {customer.cust_name} | {customer.bill_address} | {customer.cust_phone}
          </ListGroup.Item> 
        )
      ) 
    }
    </ListGroup>
    </div>
  )
}

export default SearchableInput
