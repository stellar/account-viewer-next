import React from "react";
import styled from "styled-components";
import { Heading2, TextLink } from "@stellar/design-system";
import { wallets } from "constants/wallets";
import { renderSvg } from "helpers/renderSvg";

const WrapperEl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeadlineEl = styled(Heading2)`
  margin-bottom: 0;
`;

const ContentEl = styled.div`
  width: 100%;
`;

const HeaderEl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 1.5rem;
`;

const HeaderImageEl = styled.div`
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    height: 100%;
  }
`;

const ButtonsWrapperEl = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 1rem;
  margin-top: 0.75rem;

  button {
    margin-top: 0.75rem;
  }

  button:nth-child(2) {
    margin-left: 0.5rem;
  }
`;

const InfoTextEl = styled.p`
  text-align: center;
`;

interface ModalWalletContentProps {
  type: string;
  buttonFooter?: React.ReactNode;
  children: React.ReactNode;
}

export const ModalWalletContent = ({
  type,
  buttonFooter,
  children,
}: ModalWalletContentProps) => {
  const walletData = wallets[type];

  if (!walletData) {
    throw new Error(
      "There is no Data for this wallet type. Please make sure the type is correct.",
    );
  }

  const renderInfoLink = () => {
    if (walletData.infoLink && walletData.infoLinkText) {
      return (
        <TextLink
          href={walletData.infoLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {walletData.infoLinkText}
        </TextLink>
      );
    }

    return null;
  };

  return (
    <WrapperEl>
      <HeaderImageEl>
        {renderSvg({
          Component: walletData.logoSvg,
          alt: walletData.logoImgAltText,
        })}
      </HeaderImageEl>
      <HeaderEl>
        <HeadlineEl>{walletData.title}</HeadlineEl>
      </HeaderEl>
      <ContentEl>
        <InfoTextEl>
          {walletData.infoText} {renderInfoLink()}
        </InfoTextEl>
        {children}
      </ContentEl>
      {buttonFooter && <ButtonsWrapperEl>{buttonFooter}</ButtonsWrapperEl>}
    </WrapperEl>
  );
};
