import React from 'react'

export default function singleItemLoading() {
	return (
		<div className="row">
			<div className="col-lg-6">
				<div className="single-image bg-blur mb-4" />
			</div>
			<div className="col-lg-6">
				<div className="mb-4">
					<div className="text-loading w-75 mb-3" />
					<div className="text-loading w-50" />
				</div>
				<div className="card-collapse mb-4">
					<div className="card-collapse-head text-white fw-bolder">
						<div className="text-loading w-25" />
					</div>
					<div className="card-collapse-content">
						<div className="text-loading w-75 mb-3" />
						<div className="text-loading w-50" />
					</div>
				</div>
				<div className="card-collapse mb-4">
					<div className="card-collapse-head text-white fw-bolder">
						<div className="text-loading w-25" />
					</div>
					<div className="card-collapse-content">
						<div className="text-loading w-75 mb-3" />
						<div className="text-loading w-50 mb-3" />
						<div className="text-loading w-25 mb-3" />
						<div className="text-loading w-50 mb-3" />
						<div className="text-loading w-25" />
					</div>
				</div>
				<div className="card bg-blur border-0">
					<div className="card-body">
						<div className="text-loading w-25 mb-3" />
						<div className="text-loading w-100 mb-3 p-4" />
						<div className="text-loading w-100 p-4" />
					</div>
				</div>
			</div>
		</div>
	)
}