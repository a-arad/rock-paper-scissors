import styled from 'styled-components';

const AppContainer = styled.div`
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

function App() {
  return (
    <AppContainer>
      <Title>Rock Paper Scissors</Title>
      <p>Welcome to the Rock Paper Scissors game!</p>
    </AppContainer>
  );
}

export default App;
