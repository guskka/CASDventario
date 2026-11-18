import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoWhite from '../../../../assets/brand/casdventario-white-logo.svg';
import LogotypeBlack from '../../../../assets/brand/casdventario-black-logotype.svg';
import LogotypeWhite from '../../../../assets/brand/casdventario-white-logotype.svg';
import { Link } from 'react-router-dom';
import InputFloatingLabel from '../../../../components/ui/input-floating-label';
import { Button } from '@/components/ui/button';
import { login } from '@/lib/api';

export default function SignIn() {
  const navigate = useNavigate();

  // Guarda o que a pessoa digita nos campos.
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // evita o navegador recarregar a página ao enviar o form
    setErro('');
    setCarregando(true);

    try {
      const usuario = await login(email, senha);

      // Login OK: guarda os dados do usuário e o token (JWT) desta aba.
      // O token é enviado automaticamente em toda chamada à API (ver lib/api.js).
      sessionStorage.setItem('usuario', JSON.stringify(usuario));

      navigate('/'); // página inicial: o Dashboard
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="h-screen flex flex-col font-geist">
      <div className="flex flex-1">
        <aside className="flex items-center justify-center w-1/2 bg-primary">
          <img
            className="w-72 select-none"
            src={LogoWhite}
            alt="Logo CASDventário"
          />
        </aside>
        <main className="flex flex-1 items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full px-32 space-y-6"
          >
            <div className="flex flex-col space-y-3 items-center">
              <img
                className="w-42 select-none dark:hidden"
                src={LogotypeBlack}
                alt="Logotipo CASDventário"
              />
              <img
                className="hidden w-42 select-none dark:block"
                src={LogotypeWhite}
                alt="Logotipo CASDventário"
              />
              <h2 className="text-center text-3xl font-bold">Entrar</h2>
            </div>

            {erro && (
              <p className="text-center text-sm text-destructive">{erro}</p>
            )}

            <InputFloatingLabel
              text={'Email'}
              type={'email'}
              id={'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputFloatingLabel
              text={'Senha'}
              type={'password'}
              id={'user-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <p className="font-semibold text-primary underline active:text-foreground">
              <Link to={'/forgotpassword'}>Esqueceu a senha?</Link>
            </p>
            <Button
              type="submit"
              variant="default"
              className="py-5"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta? Peça a um Administrador Mestre para cadastrar você.
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
