import LogoWhite from '../../../../assets/brand/casdventario-white-logo.svg';
import LogotypeBlack from '../../../../assets/brand/casdventario-black-logotype.svg';
import LogotypeWhite from '../../../../assets/brand/casdventario-white-logotype.svg';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import InputFloatingLabel from '../../../../components/ui/input-floating-label';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
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
          <div className="flex flex-col w-full px-32 space-y-6">
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
              <h2 className="text-center text-3xl font-bold">
                Redefina sua senha
              </h2>
              <p className="text-center">
                Digite o endereço de email verificado da sua conta de usuário
                para poder lhe enviarmos um link de redefinição de senha.
              </p>
            </div>
            <InputFloatingLabel
              textFocus={'peer-focus:text-cyan-600'}
              borderFocus={'focus:border-cyan-600'}
              background={'bg-white'}
              text={'Email'}
              type={'email'}
              id={'email'}
            />
            <Button variant="default" className="py-5">
              Enviar link de redefinição de senha
            </Button>
            <p className="py-2 rounded-md text-sm text-center text-secondary-foreground bg-secondary">
              <Link
                to={'/signin'}
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon size={20} />
                Voltar
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
