import { Formik, Field, Form, useFormik } from "formik";
import { useState } from 'react';
import { useAuth } from '../../../context/authContext'; // Assurez-vous que le chemin d'importation est correct

interface LoginFormValues {
  utilisateur: string;
  password: string;
}

const LoginForm = () => {
  const { authenticateUser } = useAuth(); // Utilisation du hook pour accéder à authenticateUser
  const [isLoading, setIsLoading] = useState(false); // État pour le suivi du chargement

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      utilisateur: '',
      password: '',
    },
    onSubmit: async (values) => {
      setIsLoading(true); // Commence le chargement
      try {
        await authenticateUser({ username: values.utilisateur, password: values.password });
      } catch (error) {
        console.error('Erreur d\'authentification', error);
      }
      setIsLoading(false);
    },
    validate: values => {
      const errors: Partial<LoginFormValues> = {};
      if (!values.utilisateur) {
        errors.utilisateur = 'Required';
      } else if (values.utilisateur.length < 1) {
        errors.utilisateur = 'Must be 1 characters or more';
      }
      if (!values.password) {
        errors.password = 'Required';
      } else if (values.password.length < 1) {
        errors.password = 'Must be 1 characters or more';
      }
      return errors;
    }
  });

  if (isLoading) {
    return <div>Chargement...</div>; // Ou un composant de spinner/loader
  }

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
      <div className="grid self-center">
        <label htmlFor="utilisateur">Utilisateur</label>
        <input
          id="utilisateur"
          type="text" // Correction du type ici, il devrait être 'text' au lieu de 'utilisateur'
          className="border-none outline-none bg-input dark:primary-foreground text-foreground dark:text-white rounded-xl" // Correction de la classe ici
          {...formik.getFieldProps('utilisateur')}
        />
        {formik.touched.utilisateur && formik.errors.utilisateur ? (
          <span>{formik.errors.utilisateur}</span>
        ) : null}
      </div>
      <div className="grid self-center">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="border-none outline-none bg-input dark:primary-foreground text-foreground dark:text-white rounded-xl"
          {...formik.getFieldProps('password')}
        />
        {formik.touched.password && formik.errors.password ? (
          <span>{formik.errors.password}</span>
        ) : null}
      </div>
      <div>
        <button className="mt-4 bg-input dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground dark:text-gray-200 font-bold py-2 px-4 rounded" type="submit" disabled={!formik.isValid || isLoading}>Connexion</button>
      </div>
    </form>
  );
};

export default LoginForm;