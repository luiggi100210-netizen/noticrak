import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  RichTextField,
  useNotify,
  useRedirect,
  required,
  minLength,
  Filter,
  SearchInput,
} from 'react-admin';

const CATEGORIAS = [
  { id: 'cusco', name: 'Cusco' },
  { id: 'nacional', name: 'Nacional' },
  { id: 'politica', name: 'Política' },
  { id: 'economia', name: 'Economía' },
  { id: 'deportes', name: 'Deportes' },
  { id: 'tecnologia', name: 'Tecnología' },
  { id: 'internacional', name: 'Internacional' },
  { id: 'entretenimiento', name: 'Entretenimiento' },
];

const NoticiasFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="buscar" alwaysOn />
    <SelectInput source="categoria" choices={CATEGORIAS} />
    <BooleanInput source="publicado" label="Solo publicadas" />
  </Filter>
);

export const NoticiasList = () => (
  <List
    filters={<NoticiasFilter />}
    sort={{ field: 'createdAt', order: 'DESC' }}
    perPage={20}
    title="Noticias"
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="titulo" label="Título" />
      <TextField source="categoria" label="Categoría" />
      <TextField source="autor_nombre" label="Autor" />
      <BooleanField source="publicado" label="Publicado" />
      <BooleanField source="destacado" label="Destacado" />
      <TextField source="vistas" label="Vistas" />
      <DateField source="fecha_publicacion" label="Publicado el" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const NoticiaForm = () => (
  <SimpleForm>
    <TextInput source="titulo" label="Título" validate={[required(), minLength(5)]} fullWidth />
    <TextInput source="resumen" label="Resumen / Bajada" multiline rows={3} fullWidth />

    <SelectInput
      source="categoria"
      label="Categoría"
      choices={CATEGORIAS}
      validate={required()}
    />

    <TextInput
      source="contenido"
      label="Contenido (HTML permitido)"
      multiline
      rows={12}
      fullWidth
      validate={[required(), minLength(20)]}
    />

    <TextInput source="imagen_url" label="URL de imagen" fullWidth />
    <TextInput source="imagen_public_id" label="Cloudinary Public ID" fullWidth />
    <TextInput source="video_url" label="URL de video (YouTube u otro)" fullWidth />
    <TextInput source="tags" label="Tags (separados por coma)" fullWidth />

    <BooleanInput source="publicado" label="Publicar inmediatamente" />
    <BooleanInput source="destacado" label="Marcar como destacada" />
  </SimpleForm>
);

export const NoticiasCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Create
      title="Nueva Noticia"
      mutationOptions={{
        onSuccess: () => {
          notify('Noticia creada correctamente', { type: 'success' });
          redirect('list', 'noticias');
        },
      }}
    >
      <NoticiaForm />
    </Create>
  );
};

export const NoticiasEdit = () => {
  const notify = useNotify();

  return (
    <Edit
      title="Editar Noticia"
      mutationMode="pessimistic"
      mutationOptions={{
        onSuccess: () => {
          notify('Noticia actualizada', { type: 'success' });
        },
      }}
    >
      <NoticiaForm />
    </Edit>
  );
};
