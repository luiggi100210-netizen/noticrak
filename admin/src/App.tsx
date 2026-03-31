import {
  Admin,
  Resource,
  CustomRoutes,
} from 'react-admin';
import { Route } from 'react-router-dom';
import simpleRestProvider from 'ra-data-simple-rest';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import authProvider from './authProvider';
import { NoticiasList, NoticiasCreate, NoticiasEdit } from './resources/Noticias';
import { VideosList, VideosCreate, VideosEdit } from './resources/Videos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Custom data provider que añade el token JWT a cada request
const baseDataProvider = simpleRestProvider(API_URL);

const dataProvider = {
  ...baseDataProvider,
  getList: (resource: string, params: any) => {
    // Mapear los recursos de admin a las rutas del backend
    const resourceMap: Record<string, string> = {
      noticias: 'noticias/admin/todas',
      videos: 'noticias/admin/todas',
    };
    const backendResource = resourceMap[resource] || resource;

    // Añadir filtro de video para el recurso videos
    if (resource === 'videos') {
      params.filter = { ...params.filter, hasVideo: true };
    }

    return baseDataProvider.getList(backendResource, params);
  },
  getOne: (resource: string, params: any) => {
    return baseDataProvider.getOne('noticias', params);
  },
  create: (resource: string, params: any) => {
    return baseDataProvider.create('noticias', params);
  },
  update: (resource: string, params: any) => {
    return baseDataProvider.update('noticias', params);
  },
  delete: (resource: string, params: any) => {
    return baseDataProvider.delete('noticias', params);
  },
};

// Interceptor para añadir token JWT
import axios from 'axios';
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function App() {
  return (
    <Admin
      title="NotiCrack Admin"
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={undefined}
      disableTelemetry
    >
      <Resource
        name="noticias"
        list={NoticiasList}
        create={NoticiasCreate}
        edit={NoticiasEdit}
        icon={NewspaperIcon}
        options={{ label: 'Noticias' }}
      />
      <Resource
        name="videos"
        list={VideosList}
        create={VideosCreate}
        edit={VideosEdit}
        icon={VideoLibraryIcon}
        options={{ label: 'Videos' }}
      />
    </Admin>
  );
}
