import MainComponentFaq from './FAQ/main_component';
import OrderBotChat from './orderBot/orderBotChat';
import { Route, Router } from 'react-router-dom';
import history from './history';

function App() {

  return (
  <>
   <Router history={history}>
  
   <Route path="/faqbot" exact component={MainComponentFaq} />
   <Route path="/orderbot" exact component={OrderBotChat} />
   </Router> 
  
  </>
  )
}

export default App;
