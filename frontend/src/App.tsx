import React from 'react';
import { Game } from './components/Game';
import { GlobalStyle, Container } from './styles/GlobalStyles';

function App() {
  return (
    <>
      <GlobalStyle />
      <Container>
        <Game />
      </Container>
    </>
  );
}

export default App;
