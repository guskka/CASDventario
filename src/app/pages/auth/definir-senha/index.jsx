import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import LogoWhite from '../../../../assets/brand/casdventario-white-logo.svg';
import LogotypeBlack from '../../../../assets/brand/casdventario-black-logotype.svg';
import LogotypeWhite from '../../../../assets/brand/casdventario-white-logotype.svg';
import InputFloatingLabel from '../../../../components/ui/input-floating-label';
import { Button } from '@/components/ui/button';
import { definirSenha } from '@/lib/api';

// Mesma regra do backend: pelo menos 8 caracteres, 1 número e 1 maiúscula.
function senhaValida(senha) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
}

// Tela aberta pelo link do email (convite de novo administrador ou
// "esqueci minha senha"): /definir-senha?token=...
export default function DefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState(token ? '' : 'Link inválido. Abra o link recebido por email.');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

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

    setEnviando(true);
    try {
      const resposta = await definirSenha(token, senha);
      setSucesso(`${resposta.mensagem} Redirecionando para o login...`);
      setTimeout(() => navigate('/signin', { replace: true }), 2500);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="h-screen flex flex-col font-geist">
      <div className="flex flex-1">
        <aside className="flex items-center justify-center w-1/2 bg-primary">
          <img className="w-72 select-none" src={LogoWhite} alt="Logo CASDventário" />
        </aside>
        <main className="flex flex-1 items-center justify-center">
          <form onSubmit={handleSubmit} className="flex flex-col w-full px-32 space-y-6">
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
              <h2 className="text-center text-3xl font-bold">Crie sua senha</h2>
              <p className="text-center">
                Escolha a senha que você vai usar para entrar no CASDventário.
              </p>
            </div>

            {erro && <p className="text-center text-sm text-destructive">{erro}</p>}
            {sucesso && <p className="text-center text-sm text-primary">{sucesso}</p>}

            <div className="space-y-1">
              <InputFloatingLabel
                text={'Nova senha'}
                type={'password'}
                id={'nova-senha'}
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                *A senha deve ter pelo menos 8 caracteres, incluindo um número e uma letra
                maiúscula.
              </p>
            </div>
            <InputFloatingLabel
              text={'Confirmar senha'}
              type={'password'}
              id={'confirmar-senha'}
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
            <Button
              type="submit"
              variant="default"
              className="py-5"
              disabled={enviando || !token || Boolean(sucesso)}
            >
              {enviando ? 'Salvando...' : 'Criar senha'}
            </Button>
            <p className="py-2 rounded-md text-sm text-center text-secondary-foreground bg-secondary">
              <Link to={'/signin'} className="flex items-center justify-center gap-2">
                <ArrowLeftIcon size={20} />
                Voltar para o login
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
