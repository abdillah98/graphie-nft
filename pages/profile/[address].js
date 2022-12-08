import {useRef, useState, useEffect} from 'react'
import Image from 'next/image'
import {storage} from '../../firebase/config'
import {uploadFirebase, getAccounts, getAccount, updateAccounts} from '../../helpers'
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {v4} from 'uuid'
import DefaultImage from '../../images/default-img.png'

export default function Profile({address}) {
	const bannerImage = useRef(null);
	const profileImage = useRef(null);

	const [bannerFile, setBannerFile] = useState(null)
	const [profileFile, setProfileFile] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [form, setForm] = useState({
		accountAddress: '',
		accountName: '',
		accountPicture: '',
		accountBanner: '',
		accountDescription: ''
	})

	useEffect(() => {
		const _getAccount = async () => {
			const accounts = await getAccount(address)
			setForm(prev => ({
				...form,
				id: accounts.id,
				accountName: accounts.account_name,
				accountAddress: accounts.account_address,
				accountPicture: accounts.account_picture,
				accountBanner: accounts.account_banner,
				accountDescription: accounts.account_description,
			}))
			console.log('_getAccount')
			// console.log(accounts)
		}
		_getAccount()
	}, [address])

	useEffect(() => {
		console.log('~form')
		console.log(bannerFile)
		console.log(profileFile)
		console.log(form)
	}, [form, bannerFile, profileFile])

	const _openBannerImage = () => {
		bannerImage.current.click()
	}

	const _openProfileImage= () => {
		profileImage.current.click()
	}

	const _changeBannerFile = (e) => {
		const {files} = e.target;

		if(!files) return;

		setBannerFile(files[0])
		setForm(prev => ({
			...prev, 
			accountBanner: URL.createObjectURL(files[0])
		}))
	}

	const _changeProfileFile = (e) => {
		const {files} = e.target;

		if(!files) return;

		setProfileFile(files[0])
		setForm(prev => ({
			...prev, 
			accountPicture: URL.createObjectURL(files[0])
		}))
	}

	const _updateProfile = async () => {
		setIsLoading(true)
		const accountPicture = await uploadFirebase(profileFile)
		const accountBanner = await uploadFirebase(bannerFile)
		const accounts = await updateAccounts({
			id: form.id, 
			account_name: form.accountName, 
			account_address: form.accountAddress,
			account_picture: accountPicture || form.accountPicture,
			account_banner: accountBanner || form.accountBanner,
			account_description: form.accountDescription,
		})
		alert('Update profile successed!')
		setIsLoading(false)
	}

	return (
		<div className="container">
		  <div className="row justify-content-center mb-5">
			  <div className="col-lg-6 mb-5">
			  	<h1 className="fw-bolder text-white mb-4">Profile</h1>
			  	<form>
			  		<div className="mb-4">
			  			<input 
			  			  type="file" 
			  			  className="form-control d-none" 
			  			  id="image"
			  			  ref={bannerImage} 
			  			  onChange={_changeBannerFile}
			  			/>
				  		{
				  			form.accountBanner ?
				  			<>
				  			  <div className="card-profile mb-2">
				  				  <div className="card-profile-banner">
			  				  		<Image 
			  				  			src={form.accountBanner} 
			  				  			layout="fill" 
			  				  			alt="image-banner" 
			  				  		/>
				  				  </div>
				  				</div>
			  					<button 
		  				  			type="button" 
		  				  			className="btn btn-outline-light btn-sm"
		  				  			onClick={_openBannerImage}
		  				  		>
		  				  			Change banner
		  				  		</button>
			  				</> :
					  		<div className="card bg-transparent border-dashed" onClick={_openBannerImage}>
						  		<div className="card-body text-center cursor-pointer">
						  			<span className="d-block mb-3">Click here to upload banner image.</span>
						  			<Image className="mb-3" src={DefaultImage} width={100} alt="upload-banner"/>
				  	    		<div className="form-text mb-2">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM. Max size: 100 MB</div>
						  		</div>
					  		</div>
				  		}
			  		</div>
						<div className="mb-3">
							<div className="row">
								<div className="col-12 col-md-4 col-lg-3">
									<label 
									  htmlFor="image" 
									  className="form-label fw-bold text-white"
									>
										Profile image
									</label>
									<input 
									  type="file" 
									  className="form-control d-none" 
									  id="image" 
									  ref={profileImage} 
									  onChange={_changeProfileFile}
									/>
									{
										form.accountPicture ?
										<>
											<Image 
												src={form.accountPicture} 
												alt="image-profile" 
												className="rounded mb-2"
												width={200}
												height={200}
											/>
											<button 
												type="button" 
												className="btn btn-outline-light btn-sm"
												onClick={_openProfileImage}
											>
												Change
											</button>
										</>
										 :
							  		<div className="card bg-transparent border-dashed" onClick={_openProfileImage}>
								  		<div className="card-body text-center cursor-pointer">
								  			<Image src={DefaultImage} width={100} alt="upload-banner"/>
					  					</div>
						  			</div>
									}
					  		</div>
				  		</div>
			  		</div>
			  	  <div className="mb-3">
			  	  	<label 
					  	      htmlFor="name" 
					  	      className="form-label fw-bold text-white"
					  	    >
					  	      Name <span className="text-danger">*</span>
					  	    </label>
					  	    <div className="form-text mb-2">The name will be included as your account name. </div>
					  	    <input 
					  	      type="text" 
					  	      className="form-control" 
					  	      id="name" 
					  	      placeholder="beauty nft..."
					  	      value={form.accountName}
					  	      onChange={(e) => setForm({...form, accountName: e.target.value})}
					  	    />
			  	  </div>
			  	  <div className="mb-3">
			  	    <label 
			  	      htmlFor="description" 
			  	      className="form-label fw-bold text-white"
			  	    >
			  	      Description <span className="text-danger">*</span>
			  	    </label>
			  	    <div className="form-text mb-2">The description will be included on the your detail account. </div>
			  	    <textarea 
			  	      className="form-control" 
			  	      id="description" 
			  	      placeholder="description here..." 
			  	      rows="3"
			  	      value={form.accountDescription} 
			  	      onChange={(e) => setForm({...form,  accountDescription: e.target.value})}
			  	    />
			  	  </div>
			  	  <button 
			  	    type="button" 
			  	    className="btn btn-gradient px-4"
			  	    onClick={_updateProfile}
			  	    disabled={isLoading}
			  	  >
			  	    {isLoading ? 
			  	    <span>Loading...</span> :
			  	    <span>Save</span>
			  	  	}
			  	  </button>
					</form>
				</div>
			</div>
		</div>
	)
}

export async function getServerSideProps(context) {
	const  { address } = context.query;
  return {
    props: {address}, // will be passed to the page component as props
  }
}