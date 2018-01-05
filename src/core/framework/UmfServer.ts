import { FormMetadata, FormResponse, FormResponseMetadata } from 'uimf-core';
import { FormInstance } from './FormInstance';
import * as axiosLib from 'axios';

let axios = axiosLib.default;

export class UmfServer {
    private readonly getMetadataUrl: string;
    private readonly postFormUrl: string;

	/**
	 * Creates a new instance of UmfApp.
	 */
    constructor(getMetadataUrl: string, postFormUrl: string) {
        this.getMetadataUrl = getMetadataUrl;
        this.postFormUrl = postFormUrl;
    }

    getMetadata(formId: string): Promise<FormMetadata> {
        return axios.get(`${this.getMetadataUrl}/${formId}`).then((response: axiosLib.AxiosResponse) => {
            return <FormMetadata>response.data;
        }).catch(e => {
            console.warn(`Did not find form '${formId}'.`);
            return null;
        });
    }

    getAllMetadata(): Promise<FormMetadata[]> {
        return axios.get(this.getMetadataUrl).then((response: axiosLib.AxiosResponse) => {
            return <FormMetadata[]>response.data;
        });
    }

    postForm(form: string, data: any): Promise<any> {
        return axios.post(this.postFormUrl, JSON.stringify([{
            Form: form,
            RequestId: 1,
            InputFieldValues: data
        }]), <axiosLib.AxiosRequestConfig>{
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response: axiosLib.AxiosResponse) => {
            let invokeFormResponses = <InvokeFormResponse[]>response.data;

            // Make sure metadata is never null.
            invokeFormResponses[0].data.metadata = invokeFormResponses[0].data.metadata || new FormResponseMetadata();

            return invokeFormResponses[0].data;
        }).catch((error: axiosLib.AxiosError) => {
            alert(error.response.data.error);
            return null;
        });
    }
}

class InvokeFormResponse {
    public data: FormResponse;
    public requestId: string;
}