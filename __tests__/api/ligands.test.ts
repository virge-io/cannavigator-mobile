import { fetchLigands, fetchLigandProfile } from '../../src/api/ligands';

import apiClient from '../../src/api/client';

jest.mock('../../src/api/client', () => {
  const mockAxios = {
    get: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  return { __esModule: true, default: mockAxios };
});
const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ligands API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchLigands calls /ligands with default paging', async () => {
    const mockPage = {
      items: [
        {
          id: '1',
          slug: 'cbd',
          display_name: 'CBD',
          type: 'Phytocannabinoid',
          chemical_family: null,
          synonyms: [],
        },
      ],
      total: 1,
      skip: 0,
      limit: 50,
      has_more: false,
    };
    mockedClient.get.mockResolvedValue({ data: mockPage });

    const result = await fetchLigands();

    expect(mockedClient.get).toHaveBeenCalledWith('/ligands', {
      params: { type: undefined, q: undefined, skip: 0, limit: 50 },
    });
    expect(result).toEqual(mockPage);
  });

  it('fetchLigands passes type filter and skip', async () => {
    mockedClient.get.mockResolvedValue({
      data: { items: [], total: 0, skip: 0, limit: 50, has_more: false },
    });

    await fetchLigands({ type: 'Terpene', skip: 50 });

    expect(mockedClient.get).toHaveBeenCalledWith('/ligands', {
      params: { type: 'Terpene', q: undefined, skip: 50, limit: 50 },
    });
  });

  it('fetchLigandProfile calls /ligands/{slug}', async () => {
    const mockProfile = {
      id: '1',
      slug: 'cbd',
      display_name: 'CBD',
      type: 'Phytocannabinoid',
      synonyms: [],
      targets: [],
      diseases: [],
      conclusions: [],
      paper_count: 0,
      interactions: [],
    };
    mockedClient.get.mockResolvedValue({ data: mockProfile });

    const result = await fetchLigandProfile('cbd');

    expect(mockedClient.get).toHaveBeenCalledWith('/ligands/cbd');
    expect(result).toEqual(mockProfile);
  });
});
