import { Button, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';

const ButtonWithLoading = (
  {
    handleClick, 
    tooltip, 
    buttonText, 
    isLoading=false,
    isDone=false,
    variant="primary",
    isDisabled=false,
    ...props
  }) => {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {tooltip}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      show={tooltip && !isDisabled}
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
    <Button
      variant={variant} 
      type='button' 
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      {...props}
      >
      { isLoading ? <Spinner size='sm' animation="border" /> : null }
      { isDone ? 'Done!' : buttonText}                        
    </Button>   
    </OverlayTrigger>
  );
}

export default ButtonWithLoading