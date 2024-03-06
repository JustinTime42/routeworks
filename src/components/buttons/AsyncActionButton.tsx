import React, { useState } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { BsCheckCircleFill } from "react-icons/bs";

interface Props {
  asyncAction: () => Promise<any>;
  label: string;
  style?: React.CSSProperties | undefined;
  size?: "sm" | "lg" | undefined;
  disabled?: boolean;
}

const AsyncActionButton = ({
  asyncAction,
  label,
  style = undefined,
  size = undefined,
  disabled = false,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {error && (
        <Alert dismissible variant="danger">
          {error}
        </Alert>
      )}
      <Button
        size={size}
        variant={success && !loading ? "success" : "primary"}
        style={style}
        onClick={handleClick}
        disabled={loading || disabled}
      >
        {label}
        {loading && (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        )}
        {success && !loading && <BsCheckCircleFill color="white" />}
      </Button>
    </>
  );
};

export default AsyncActionButton;
