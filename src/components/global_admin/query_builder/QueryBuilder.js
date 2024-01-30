import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { db } from '../../../firebase';
import { collection as coll, getDocs, query, where } from 'firebase/firestore';
import 'firebase/firestore';
import { Link } from 'react-router-dom';

const QueryBuilder = () => {
  const [queryResult, setQueryResult] = useState(null);
  const [collection, setCollection] = useState('');
  const [field, setField] = useState('');
  const [operator, setOperator] = useState('');
  const [value, setValue] = useState('');

  const handleQuery = async (e) => {
    e.preventDefault();
    const q = query(coll(db, collection), where(field.trim(), operator.trim(), value.trim())) ;

    try {
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setQueryResult(data);
    } catch (error) {
      console.error('Error executing query:', error);
    }
  };

  return (
    <div>          
      <Link to="/">
        <Button variant="primary">
          Go to Home
        </Button>
      </Link>
      <Form onSubmit={handleQuery}>
        <Form.Group controlId="collection">
          <Form.Label>Collection</Form.Label>
          <Form.Control
            type="text"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="field">
          <Form.Label>Field</Form.Label>
          <Form.Control
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="operator">
          <Form.Label>Operator</Form.Label>
          <Form.Control
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="value">
          <Form.Label>Value</Form.Label>
          <Form.Control
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Execute Query
        </Button>
      </Form>

      {queryResult && (
        <div>
          <h2>Query Result:</h2>
          <pre>{JSON.stringify(queryResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QueryBuilder;
