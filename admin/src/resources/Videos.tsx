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
  required,
  Filter,
  SearchInput,
  UrlField,
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

const VideosFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="buscar" alwaysOn />
    <SelectInput source="categoria" choices={CATEGORIAS} />
  </Filter>
);

export const VideosList = () => (
  <List
    filters={<VideosFilter />}
    filter={{ hasVideo: true }}
    sort={{ field: 'fecha_publicacion', order: 'DESC' }}
    perPage={20}
    title="Noticias con Video"
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="titulo" label="Título" />
      <TextField source="categoria" label="Categoría" />
      <UrlField source="video_url" label="Video URL" />
      <BooleanField source="publicado" label="Publicado" />
      <DateField source="fecha_publicacion" label="Fecha" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const VideoForm = () => (
  <SimpleForm>
    <TextInput source="titulo" label="Título" validate={required()} fullWidth />
    <TextInput source="resumen" label="Resumen" multiline rows={3} fullWidth />
    <SelectInput source="categoria" label="Categoría" choices={CATEGORIAS} validate={required()} />
    <TextInput
      source="contenido"
      label="Descripción completa"
      multiline
      rows={6}
      fullWidth
      validate={required()}
    />
    <TextInput source="video_url" label="URL de Video (YouTube)" fullWidth validate={required()} />
    <TextInput source="imagen_url" label="URL de imagen miniatura" fullWidth />
    <BooleanInput source="publicado" label="Publicar" />
  </SimpleForm>
);

export const VideosCreate = () => (
  <Create title="Nuevo Video">
    <VideoForm />
  </Create>
);

export const VideosEdit = () => (
  <Edit title="Editar Video" mutationMode="pessimistic">
    <VideoForm />
  </Edit>
);
