import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoWhite from '../../../assets/brand/casdventario-white-logo.svg';
import LogotypeBlack from '../../../assets/brand/casdventario-black-logotype.svg';
import LogotypeWhite from '../../../assets/brand/casdventario-white-logotype.svg';
import { Link } from 'react-router-dom';
import InputFloatingLabel from '../../../components/ui/input-floating-label';
import { Button } from '@/components/ui/button';
import { cadastrarUsuario } from '@/lib/api';

// Confere se a senha tem pelo menos 8 caracteres, 1 número e 1 maiúscula
// (mesma regra que já está escrita no texto de ajuda da tela).
function senhaValida(senha) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
}

export default function SignUp() {
  const navigate = useNavigate();

  const [primeiroNome, setPrimeiroNome] = useState('');
  const [segundoNome, setSegundoNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas devem ser as mesmas.');
      return;
    }

    if (!senhaValida(senha)) {
      setErro('A senha deve ter pelo menos 8 caracteres, incluindo um número e uma letra maiúscula.');
      return;
    }

    setCarregando(true);

    try {
      await cadastrarUsuario({
        nome: `${primeiroNome} ${segundoNome}`.trim(),
        email,
        senha,
        // A tela não tem um campo de "apelido" separado — por enquanto,
        // uso o primeiro nome como valor padrão, já que a coluna no banco
        // é obrigatória. Se quiserem um apelido de verdade, adicionem um
        // InputFloatingLabel pra isso e troquem essa linha.
        apelidos: primeiroNome,
      });

      setSucesso(true);
      setTimeout(() => navigate('/signin'), 1500);
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
            {sucesso && (
              <p className="text-center text-sm text-primary">
                Cadastro realizado! Redirecionando para o login...
              </p>
            )}

            <div className="flex flex-row space-x-2">
              <InputFloatingLabel
                text={'Primeiro nome'}
                type={'text'}
                id={'first-name'}
                value={primeiroNome}
                onChange={(e) => setPrimeiroNome(e.target.value)}
              />
              <InputFloatingLabel
                text={'Segundo nome'}
                type={'text'}
                id={'middle-name'}
                value={segundoNome}
                onChange={(e) => setSegundoNome(e.target.value)}
              />
            </div>
            <InputFloatingLabel
              text={'Email'}
              type={'email'}
              id={'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="space-y-1">
              <InputFloatingLabel
                text={'Senha'}
                type={'password'}
                id={'user-password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                *A senha deve ter pelo menos 8 caracteres, incluindo um número e
                uma letra maiúscula.
              </p>
            </div>
            <div className="space-y-1">
              <InputFloatingLabel
                text={'Confirmar senha'}
                type={'password'}
                id={'confirmation-user-password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                *As senhas devem ser as mesmas.
              </p>
            </div>
            <Button
              type="submit"
              variant="default"
              className="py-5"
              disabled={carregando}
            >
              {carregando ? 'Enviando...' : 'Enviar solicitação de cadastro'}
            </Button>
            <p className="text-center">
              Já possui uma conta?{' '}
              <Link
                to={'/signin'}
                className="font-semibold text-primary cursor-pointer underline active:text-foreground"
              >
                Entrar
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
