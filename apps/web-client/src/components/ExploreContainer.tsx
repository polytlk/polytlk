import './ExploreContainer.css';
import { useState, useEffect } from 'react'
import InterpretBar from './InterpretContainer';


import type { ClientConfig } from '../utils/config'
import Config from '../utils/config'


const ExploreContainer: React.FC<Record<string, never>> = () => {
  const [taskResult, setTaskResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await Config.getInstance();
      setConfig(config.get());
      setIsLoading(false);
    }

    fetchConfig();
  }, []);


  const handleTaskResult = (result: string) => {
    setTaskResult(result);
  };

  if (isLoading || !config) {
    return <p>Loading...</p>;
  }

  

  return (
    <div className="container">
      <strong>Welcome to polytlk. Please input chinese you want to understand.</strong>
      {taskResult && <p>Task result: {taskResult}</p>}
      <InterpretBar onTaskResult={handleTaskResult} config={config}/>
    </div>
  );
};

export default ExploreContainer;
