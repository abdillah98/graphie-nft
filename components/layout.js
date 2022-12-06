import Navbar from './Navbar';

export default function layout({children}) {
	return (
		<div className="wrapper">
			<Navbar />
			<main>{children}</main>
		</div>
	)
}