import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/ui/header";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PencilSimpleIcon } from "@phosphor-icons/react";
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
import { useState } from "react";
import { useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const [user, setUser] = useState("Adminstrador");
  const [username, setUsername] = useState("Adm");
  const password = "12345678Aa";
  const email = "adm@example.com";
  const roles = [
    { label: "Administrador Básico", value: "BASICO" },
    { label: "Administrador Mestre", value: "MESTRE" },
  ];
  const createdAccountDate = new Date().toLocaleDateString();
  const modifiedAccountDate = new Date().toLocaleDateString();

  const avatarUrl = `https://api.dicebear.com/10.x/shadows/svg?seed=${encodeURIComponent(user)}`;

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // Função para lidar com seleção de arquivos
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl); // Atualiza o preview da imagem
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={"Perfil"} AccountName={user} AccountPosition={roles[0].label} />
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex flex-col">
                <h3 className="font-semibold text-xl">Informações do perfil</h3>
                <p className="text-sm line text-muted-foreground">
                  Altere da forma como quiser a sua conta. Alguns campos não podem ser alterados.
                </p>
              </div>
              <form className="flex gap-12">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                      id="name"
                      defaultValue={user}
                      onValueChange={setUser}
                      autoComplete="off"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="username">Apelido</FieldLabel>
                    <Input
                      id="username"
                      defaultValue={username}
                      onValueChange={setUsername}
                      autoComplete="off"
                    />
                    <FieldDescription>
                      O apelido serve apenas como forma de identificação rápida e usual para busca
                      em tabelas. Se não quiser, deixe em branco.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        defaultValue={password}
                        autoComplete="off"
                        type="password"
                        disabled
                      />
                      <Button id="password" variant="secondary">
                        Mudar senha
                      </Button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      defaultValue={email}
                      autoComplete="off"
                      type="email"
                      disabled
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="role">Cargo</FieldLabel>
                    <Select id="role" items={roles} defaultValue="BASICO" disabled>
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
                    <p>{createdAccountDate}</p>
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel>Última atualização em:</FieldLabel>
                    <p>{modifiedAccountDate}</p>
                  </Field>
                  <Field orientation="horizontal">
                    <Button>Salvar alterações</Button>
                  </Field>
                </FieldGroup>
                <div className="relative inline-block mx-16">
                  <Avatar className="w-56 h-56">
                    <AvatarImage src={preview || avatarUrl} alt={email} />
                    <AvatarFallback>{user}</AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button
                    id="profile-picture-edit"
                    variant="secondary"
                    className="relative bottom-12"
                    onClick={() => fileInputRef.current?.click()} // Abre a janela de arquivos
                  >
                    <PencilSimpleIcon />
                    Editar
                  </Button>
                </div>
              </form>
              <Separator />
              <div className="flex flex-col">
                <h3 className="font-semibold text-xl text-destructive">Desativar conta</h3>
                <p className="text-sm line text-muted-foreground">
                  Depois de desativar sua conta, não há como você entrar mais em nosso sistema. Caso
                  mude de ideia, peça a um administrador para reativa-lá
                </p>
              </div>
              <Dialog>
                <DialogTrigger
                  render={<Button variant="destructive">Desativar minha conta</Button>}
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deseja realmente desativar sua conta?</DialogTitle>
                    <DialogDescription>
                      Esta ação encerrará sua sessão atual e bloqueará seu acesso ao sistema até que
                      um administrador realize a reativação.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                    <Button variant="destructive">Sim, desativar conta</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
