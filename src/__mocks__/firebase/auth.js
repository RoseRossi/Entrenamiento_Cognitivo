const mockAuth = {
	signInWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
	onAuthStateChanged: jest.fn(),
	getCurrentUser: jest.fn(),
};

export default mockAuth;