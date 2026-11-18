import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/ui/header";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { toast } from "@/components/ui/toast";
import {
  atualizarSessao,
  atualizarUsuario,
  buscarUsuario,
  enviarFoto,
  removerFoto,
  usuarioLogado,
} from "@/lib/api";
import { urlAvatar } from "@/lib/avatar";
import TrocarSenhaDialog from "./trocar-senha-dialog";
import DesativarContaDialog from "./desativar-conta-dialog";

// Mesmas regras do backend para a foto de perfil.
const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

// Data do banco -> "dd/mm/aaaa" (ou "—" enquanto carrega).
function formatarData(valor) {
  return valor ? new Date(valor).toLocaleDateString("pt-BR") : "—";
}

export default function ProfilePage() {
  const idUsuario = usuarioLogado()?.id_usuario;

  // Dados da conta como estão no banco + o que está sendo digitado.
  const [conta, setConta] = useState(null);
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const roles = [
    { label: "Administrador Básico", value: "BASICO" },
    { label: "Administrador Mestre", value: "MESTRE" },
  ];

  useEffect(() => {
    buscarUsuario(idUsuario)
      .then((dados) => {
        setConta(dados);
        setUser(dados.nome_completo);
        setUsername(dados.apelido ?? "");
      })
      .catch((err) => setErro(err.message));
  }, [idUsuario]);

  const mudou =
    conta !== null &&
    (user.trim() !== conta.nome_completo || username.trim() !== (conta.apelido ?? ""));

  async function salvarPerfil(event) {
    event.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const atualizado = await atualizarUsuario(idUsuario, {
        nome: user.trim(),
        apelido: username.trim() || null,
      });
      setConta(atualizado);
      // O cabeçalho lê o nome da sessão: atualiza para mostrar o nome novo.
      atualizarSessao({ nome_completo: atualizado.nome_completo, apelido: atualizado.apelido });
      toast.add({ type: "success", description: "Perfil atualizado com sucesso." });
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  // Foto de perfil, se a pessoa enviou uma; senão, o avatar automático.
  const avatarUrl = urlAvatar(conta?.nome_completo, conta?.url_foto);

  const fileInputRef = useRef(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  // Depois de trocar/remover a foto: atualiza a tela e o cabeçalho (que lê a sessão).
  function fotoAtualizada(atualizado, mensagem) {
    setConta(atualizado);
    atualizarSessao({ url_foto: atualizado.url_foto });
    toast.add({ type: "success", description: mensagem });
  }

  // Ao escolher um arquivo, a foto já é enviada (JPG, PNG ou WebP até 2 MB).
  const handleFileChange = async (event) => {
    const arquivo = event.target.files?.[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!arquivo) {
      return;
    }
    setErro("");
    if (!TIPOS_FOTO.includes(arquivo.type)) {
      setErro("Formato não aceito: escolha uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErro("A imagem pode ter no máximo 2 MB.");
      return;
    }

    setEnviandoFoto(true);
    try {
      fotoAtualizada(await enviarFoto(idUsuario, arquivo), "Foto de perfil atualizada.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviandoFoto(false);
    }
  };

  async function handleRemoverFoto() {
    setErro("");
    setEnviandoFoto(true);
    try {
      fotoAtualizada(await removerFoto(idUsuario), "Foto de perfil removida.");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviandoFoto(false);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={"Perfil"} />
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex flex-col">
                <h3 className="font-semibold text-xl">Informações do perfil</h3>
                <p className="text-sm line text-muted-foreground">
                  Altere da forma como quiser a sua conta. Alguns campos não podem ser alterados.
                </p>
                {erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}
              </div>
              <form className="flex gap-12" onSubmit={salvarPerfil}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                      id="name"
                      value={user}
                      onValueChange={setUser}
                      autoComplete="off"
                      required
                      disabled={!conta}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="username">Apelido</FieldLabel>
                    <Input
                      id="username"
                      value={username}
                      onValueChange={setUsername}
                      autoComplete="off"
                      disabled={!conta}
                    />
                    <FieldDescription>
                      O apelido serve apenas como forma de identificação rápida e usual para busca
                      em tabelas. Se não quiser, deixe em branco.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <div className="flex gap-2">
                      {/* A senha nunca é mostrada: só os pontinhos de exemplo. */}
                      <Input
                        id="password"
                        value="••••••••"
                        autoComplete="off"
                        type="password"
                        disabled
                        readOnly
                      />
                      <TrocarSenhaDialog idUsuario={idUsuario} />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      value={conta?.email ?? ""}
                      autoComplete="off"
                      type="email"
                      disabled
                      readOnly
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="role">Cargo</FieldLabel>
                    <Select id="role" items={roles} value={conta?.tipo ?? null} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roles.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel>Conta criada em:</FieldLabel>
                    <p>{formatarData(conta?.data_cadastro)}</p>
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel>Última atualização em:</FieldLabel>
                    <p>{formatarData(conta?.atualizado_em)}</p>
                  </Field>
                  <Field orientation="horizontal">
                    <Button type="submit" disabled={!mudou || salvando}>
                      {salvando ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </Field>
                </FieldGroup>
                <div className="relative mx-16 inline-flex flex-col items-start">
                  <Avatar className="w-56 h-56">
                    <AvatarImage
                      src={avatarUrl}
                      alt={conta?.email ?? "Avatar"}
                      className="object-cover"
                    />
                    <AvatarFallback>{conta?.nome_completo}</AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={TIPOS_FOTO.join(",")}
                    className="hidden"
                    aria-label="Escolher foto de perfil"
                  />

                  <Button
                    id="profile-picture-edit"
                    variant="secondary"
                    className="relative bottom-12"
                    disabled={!conta || enviandoFoto}
                    onClick={() => fileInputRef.current?.click()} // Abre a janela de arquivos
                  >
                    <PencilSimpleIcon />
                    {enviandoFoto ? "Enviando..." : "Editar"}
                  </Button>
                  <div className="-mt-8 space-y-1">
                    {conta?.url_foto && (
                      <Button
                        variant="ghost"
                        className="px-0 text-destructive"
                        disabled={enviandoFoto}
                        onClick={handleRemoverFoto}
                      >
                        <TrashIcon />
                        Remover foto
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, até 2 MB.</p>
                  </div>
                </div>
              </form>
              <Separator />
              <div className="flex flex-col">
                <h3 className="font-semibold text-xl text-destructive">Desativar conta</h3>
                <p className="text-sm line text-muted-foreground">
                  Ao desativar sua conta, você perderá o acesso ao sistema. Caso mude de ideia,
                  solicite a reativação a um Administrador Mestre.
                </p>
              </div>
              <div>
                <DesativarContaDialog idUsuario={idUsuario} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
