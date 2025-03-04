/// <reference types="vite/client" />
declare const REACT_APP_DEPLOY_ENV: string
interface Window {
    onYouglishAPIReady?: () => void;
    YG?: any; 
  }