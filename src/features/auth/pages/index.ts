// Re-export auth pages
// This will allow gradual migration without breaking imports

export { default as SignIn } from './SignIn';
export { default as SignUp } from './SignUp';
export { default as InvitationPage } from './invite/[token]'; 