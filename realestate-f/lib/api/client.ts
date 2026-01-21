const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface ApiError {
    message: string;
    status: number;
}

class ApiClient {
    private accessToken: string | null = null;
    private onLogout: (() => void) | null = null;

    setAccessToken(token: string | null) {
        this.accessToken = token;
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    setLogoutHandler(handler: () => void) {
        this.onLogout = handler;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const isForm = options.body && (options.body as any) instanceof FormData;
        const headers: Record<string, string> = {
            ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
            ...(options.headers as Record<string, string>),
        };

        // When sending FormData the browser will set Content-Type including boundary.
        if (!isForm) headers['Content-Type'] = 'application/json';

        const config: RequestInit = {
            headers,
            // Include credentials so refresh cookie is sent to the backend
            credentials: 'include',
            ...options,
        } as RequestInit;

        try {
            let response = await fetch(url, config);

            // If unauthorized, try to refresh access token using refresh cookie
            // BUT, don't try to refresh if we're already trying to login or register
            if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
                try {
                    const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                    if (refreshResp.ok) {
                        const refreshData = await refreshResp.json();
                        if (refreshData.access) {
                            this.setAccessToken(refreshData.access);
                            // retry original request with new token
                            (config.headers as any)['Authorization'] = `Bearer ${refreshData.access}`;
                            response = await fetch(url, config);
                        } else {
                            throw new Error('No access token in refresh response');
                        }
                    } else {
                        // Refresh failed, trigger logout
                        if (this.onLogout) this.onLogout();
                        throw new Error('Session expired');
                    }
                } catch (e) {
                    // Refresh failed completely
                    if (this.onLogout) this.onLogout();
                    throw e;
                }
            }

            if (!response.ok) {
                // Try to parse error message from response
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    // If response is not JSON, use default message
                }

                const error: ApiError = {
                    message: errorMessage,
                    status: response.status,
                };
                throw error;
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return null;
        } catch (error: any) {
            if (error.status) {
                throw error; // Already formatted API error
            }
            // Network error or other issues
            throw {
                message: error.message || 'Network error: Unable to connect to server',
                status: 0,
            };
        }
    }

    async get(endpoint: string, options: RequestInit & { params?: Record<string, any> } = {}) {
        let url = endpoint;
        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
            delete options.params;
        }

        return this.request(url, {
            method: 'GET',
            ...options
        });
    }

    async post(endpoint: string, data: any) {
        const isForm = data && data instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isForm ? data : JSON.stringify(data),
        });
    }

    async put(endpoint: string, data: any) {
        const isForm = data && data instanceof FormData;
        return this.request(endpoint, {
            method: 'PUT',
            body: isForm ? data : JSON.stringify(data),
        });
    }

    async patch(endpoint: string, data: any) {
        const isForm = data && data instanceof FormData;
        return this.request(endpoint, {
            method: 'PATCH',
            body: isForm ? data : JSON.stringify(data),
        });
    }

    async delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();