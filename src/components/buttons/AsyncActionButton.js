import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { BsCheckCircleFill } from 'react-icons/bs';

const AsyncActionButton = ({ asyncAction, label, style, size="null" }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    asyncAction()
      .then(() => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 1300);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (error) {
      // Logic to display error alert
      // This could be a modal, toast, or inline message
      console.error(error);
    }
  }, [error]);

  return (
    <>
      {error && <Alert dismissible variant="danger">{error}</Alert>}
      <Button size={size} variant={success && !loading ? "success" : "primary"} style={style} onClick={handleClick} disabled={loading}>
      {label}
        {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />}
        {success && !loading && <BsCheckCircleFill color="white" />}
        
      </Button>
    </>
  );
};

export default AsyncActionButton;
