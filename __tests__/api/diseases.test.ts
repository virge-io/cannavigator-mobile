import { fetchDiseases, fetchDiseaseDetail } from '../../src/api/diseases';

import apiClient from '../../src/api/client';

jest.mock('../../src/api/client', () => {
  const mockAxios = {
    get: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  return { __esModule: true, default: mockAxios };
});
const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

describe('diseases API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchDiseases calls /diseases with default paging', async () => {
    const mockPage = {
      items: [{ id: '1', slug: 'epilepsy', display_name: 'Epilepsy' }],
      total: 1,
      skip: 0,
      limit: 50,
      has_more: false,
    };
    mockedClient.get.mockResolvedValue({ data: mockPage });

    const result = await fetchDiseases();

    expect(mockedClient.get).toHaveBeenCalledWith('/diseases', {
      params: { q: undefined, skip: 0, limit: 50 },
    });
    expect(result).toEqual(mockPage);
  });

  it('fetchDiseases passes search query', async () => {
    mockedClient.get.mockResolvedValue({
      data: { items: [], total: 0, skip: 0, limit: 50, has_more: false },
    });

    await fetchDiseases({ q: 'epilepsy', skip: 100 });

    expect(mockedClient.get).toHaveBeenCalledWith('/diseases', {
      params: { q: 'epilepsy', skip: 100, limit: 50 },
    });
  });

  it('fetchDiseaseDetail calls /diseases/{slug}', async () => {
    const mockProfile = {
      id: '1',
      slug: 'epilepsy',
      display_name: 'Epilepsy',
      synonyms: [],
      targets: [],
      ligands: [],
      desired_effects: [],
      conclusions: [],
      paper_count: 0,
    };
    mockedClient.get.mockResolvedValue({ data: mockProfile });

    const result = await fetchDiseaseDetail('epilepsy');

    expect(mockedClient.get).toHaveBeenCalledWith('/diseases/epilepsy');
    expect(result).toEqual(mockProfile);
  });
});
