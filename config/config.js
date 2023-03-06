module.exports = CONFIG = {
	SERVER: {
		PORT: process.env.PORT || 3000,
		HOSTNAME: "localhost",
		BASEPATH: "",
		TIME_ZONE: "Asia/Kolkata"
	},
	CONSTANTS: {
		FILE_PATH: __dirname,
		PER_PAGE: 10,
		BCRYPT_SALT_ROUNDS: 10,
		JWT_SECRET: 'clinic_backendjwtauthenticationtoken',
		UPLOAD_FOLDER: '/uploads/',
		LOGO: 'assets/logo.svg',
		FRONTEND_URL: '',
		BASE_URL: "",
		APP_FRONTEND_URL: '',
		APP_URL: '',
		SITE_TITLE: 'XYZ CLINIC',
		EMAIL_TEMPLATE_PATH: 'template/mails'
	},
	/* */
	EMAIL: {
		SMTP_HOST: 'smtp.hostinger.com',
		SMTP_PORT: 465,
		SMTP_USER: 'contact@subhankarroy.in',
		SMTP_PASSWORD: 'Subhankar@2023',
		SMTP_EMAIL: 'contact@subhankarroy.in'
	},
	/* Collections */
	DB: {
		TABLE_USERS: 'users',
		TABLE_SERVICES: 'services',
		TABLE_CLIENTS: 'clients',
		TABLE_APPOINTMENTS: 'appointments',
	},
}