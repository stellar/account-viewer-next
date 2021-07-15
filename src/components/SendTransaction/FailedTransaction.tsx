import { Button } from "@stellar/design-system";
import { ModalContent } from "components/ModalContent";
import { ErrorMessage } from "components/ErrorMessage";
import { useRedux } from "hooks/useRedux";

export const FailedTransaction = ({
  onEditTransaction,
  onCancel,
}: {
  onEditTransaction: () => void;
  onCancel: () => void;
}) => {
  const { sendTx } = useRedux("sendTx");

  return (
    <ModalContent
      headlineText="Transaction failed"
      buttonFooter={
        <>
          <Button onClick={onEditTransaction}>Edit Transaction</Button>
          <Button onClick={onCancel} variant={Button.variant.secondary}>
            Close
          </Button>
        </>
      }
    >
      <p>See details below for more information.</p>
      <ErrorMessage message={`Error: ${sendTx.errorString}`} />
    </ModalContent>
  );
};
