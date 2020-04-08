/* eslint-disable camelcase */
/* eslint-disable react/static-property-placement */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { FaGithubAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

import api from '../../services/api';

import { Container, Issues, Loading, IssueFilter, PageActions } from './style';

export default class Details extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        path: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    avatar_url: '',
    repository: {},
    issues: [],
    loading: true,
    filters: [
      { state: 'all', label: 'Todas', active: true },
      { state: 'open', label: 'Abertas', active: false },
      { state: 'closed', label: 'Fechadas', active: false },
    ],
    filterIndex: 0,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filters } = this.state;
    const path = decodeURIComponent(match.params.path);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${path}`),
      api.get(`/repos/${path}/issues`, {
        params: {
          state: filters.find((f) => f.active).state,
          per_page: 5,
        },
      }),
    ]);
    this.setState({
      avatar_url: repository.data.owner.avatar_url,
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { filters, filterIndex, page } = this.state;

    const path = decodeURIComponent(match.params.path);

    const response = await api.get(`/repos/${path}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: response.data });
  };

  handleFilterClick = async (filterIndex) => {
    await this.setState({ filterIndex });
    this.loadIssues();
  };

  handlePage = async (action) => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.loadIssues();
  };

  render() {
    const {
      avatar_url,
      repository,
      issues,
      loading,
      filters,
      filterIndex,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          {repository.name}
        </h1>
        <div>
          <img src={avatar_url} alt={avatar_url} />
          <p>{repository.description}</p>
        </div>

        <Issues>
          <IssueFilter active={filterIndex}>
            {filters.map((filter, index) => (
              <button
                type="button"
                key={filter.label}
                onClick={() => this.handleFilterClick(index)}
              >
                {filter.label}
              </button>
            ))}
          </IssueFilter>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <div>
                <strong>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {issue.title}
                  </a>
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </Issues>
        <PageActions>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('back')}
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button type="button" onClick={() => this.handlePage('next')}>
            Próximo
          </button>
        </PageActions>
      </Container>
    );
  }
}
