import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import Multiselect from 'vue-multiselect';
import * as axiosLib from 'axios';
let axios = axiosLib.default;

import './Multiselect.scss';

function buildFilter(parentForm, parameters, query) {
	let promise;

	let filter = { query: query };
	if (parameters != null && parameters.length > 0) {
		promise = parentForm.form.getSerializedInputValues().then(data => {
			for (let p of parameters) {
				filter[p] = data[p];
			}

			return filter;
		});
	}
	else {
		promise = Promise.resolve(filter);
	}

	return promise;
}

@Component({
	template: require('./MultiSelect.html'),
	components: { Multiselect }
})
export class MultiSelectInput extends Vue {
	form: any;
	app: any;
	field: any;
	tabindex: number;
	id: any;

	source: any[];
	options: any[] = [];
	isLoading: boolean = false;
	private selected: any[] = [];

	created() {
		this.id = this.$attrs['id'];
		this.form = this.$attrs['form'];
		this.app = this.$attrs['app'];
		this.field = this.$attrs['field'];
		this.tabindex = parseInt(this.$attrs['tabindex']);
		this.source = this.field.metadata.customProperties.source;

		if (typeof (this.source) === 'string') {
			let addedItems = {};
			let query = '';
			let timer = null;

			let parameters = this.field.metadata.customProperties.parameters;
			let parentForm = this.form;

			buildFilter(parentForm, parameters, query).then(filter => {
				this.app.server.postForm(this.source, filter).then(data => {
					let toAdd = data.items.filter(t => {
						let key = JSON.stringify(t.value);
						if (addedItems[key] == null) {
							addedItems[key] = true;

							// Add item.
							return true;
						}

						// Don't add item.
						return false;
					});

					this.options = toAdd;

					let currentValue = this.getIdsQuery(this.field);

					if (currentValue.length > 0) {
						this.setInputValue(this.field, this.options);
					}
				});
			});
		}
		else {
			this.options = this.mapToTypeaheadItems(this.source);
			this.setInputValue(this.field, this.options);
		}
	}

	updateSelected(value) {
		if (this.field.maxItemCount !== 1) {
			this.selected = value.map(t => typeof (t) === 'string' ? t : t.value.toString());
			this.field.value.items = this.selected;
		}
	}

	asyncFind(value) {
		if (typeof (this.source) === 'string') {
			let addedItems = {};
			let timer = null;

			this.isLoading = true;
			let self = this;

			if (timer != null) {
				// Cancel previous timer, thus extending the delay until user has stopped typing.
				clearTimeout(timer);
			}

			// Search when user types something, but introduce a short delay
			// to avoid excessive http requests.
			let parameters = this.field.metadata.customProperties.parameters;
			let parentForm = this.form;

			timer = setTimeout(function () {
				buildFilter(parentForm, parameters, value).then(filter => {
					self.app.server.postForm(self.source, filter).then(data => {
						let toAdd = data.items.filter(t => {
							let key = JSON.stringify(t.value);
							if (addedItems[key] == null) {
								addedItems[key] = true;

								// Add item.
								return true;
							}

							// Don't add item.
							return false;
						});


						self.options = toAdd;
						self.isLoading = false;
					});
				});
			}, 300);
		}
	}

	getIdsQuery(field) {
		let currentValue = field.maxItemCount === 1
			? [(field.value || {}).value || '']
			: (field.value || {}).items || [];

		// Put values into an array.
		if (currentValue[0] === '') {
			currentValue = [];
		}

		return currentValue;
	}

	setInputValue(field, value) {
		if (field.maxItemCount === 1) {
			let v = value.filter(a => a.value === field.value.value) || null;
			field.value = v[0];
		}
		else {
			setTimeout(() => {
				let v = (field.value || {}).items || [];
				let result = value.filter(item => v.indexOf(item.value) !== -1);
				field.value = {
					items: result.map(t => t)
				};
			}, 300);
		}
	}

	mapToTypeaheadItems(items) {
		return items.map(t => {
			return {
				label: t.label,
				value: t.value.toString()
			};
		});
	}

	clearAll() {
		this.options = [];
	}

	limitText(count) {
		return `and ${count} other options`;
	}
}