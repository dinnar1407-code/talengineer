import '../styles/globals.css';
import { ToastProvider } from '../components/Toast';
import PwaSetup from '../components/PwaSetup';

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      {/* 全站挂载一次：注册 SW、安装提示条、登录态 Web Push 订阅 */}
      <PwaSetup />
      <Component {...pageProps} />
    </ToastProvider>
  );
}
