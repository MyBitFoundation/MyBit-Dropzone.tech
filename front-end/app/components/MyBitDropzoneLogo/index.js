import React from 'react';
import styled from 'styled-components'
import { Link } from 'react-router-dom';
import Logo from './logo.png';
import Img from '../Img';

const StyledLogo = styled(Link)`
  position: absolute;
  top: 21px;
  left: 21px;
`

const MyBitDropzoneLogo = (
    <StyledLogo to="/">
      <Img
        src={Logo}
        alt="MyBit Dropzone Dapp"
      />
    </StyledLogo>
);

export default MyBitDropzoneLogo;
