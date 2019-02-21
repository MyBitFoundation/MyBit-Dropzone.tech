import React from 'react';
import styled from 'styled-components';

const StyledDisclaimer = styled.div`
  margin: 1em;
`;
const StyledSpan = styled.span`
  display: block;
`;

const Disclaimer = () => (
  <StyledDisclaimer>
    <StyledSpan>
      This is a community driven project. The internal MyBit team is not responsible for the development of this application.
    </StyledSpan>
    <StyledSpan>
      To submit bugs click <a href="https://github.com/MyBitFoundation/MyBit-Dropzone.tech/issues">here.</a>
      To add a feature please fork the repo.
    </StyledSpan>
    <StyledSpan>
      To suggest a feature click <a href="https://t.me/mybitio">here.</a>
    </StyledSpan>
    <StyledSpan>
      To discuss this project with the community click <a href="https://hq.mybit.io/">here.</a>
    </StyledSpan>
  </StyledDisclaimer>
);

export default Disclaimer;
